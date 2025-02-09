import { Order } from "./../Order";
import { CommandHandler } from "../../shared/cqrs/command/command-handler.base";
import { CreateOrderCommand } from "./createOrder.command";
import { Fail, Result, Success } from "../../shared/core/Result";
import { OrderCreatedEvent } from "../Events/order-created.event";
import { orderEventService } from "../Service";
import { kafkaClient } from "../../shared/kafka";

export class CreateOrderHandler extends CommandHandler<
  CreateOrderCommand,
  string,
  Error
> {
  async handle(command: CreateOrderCommand): Promise<Result<string, Error>> {
    try {
      const order = Order.Create(
        crypto.randomUUID(),
        command.userId,
        command.asset,
        command.orderType,
        command.price,
        command.quantity
      );

      const orderCreatedEvent = new OrderCreatedEvent(order);
      await orderEventService.saveOrderEvent(orderCreatedEvent);

      await kafkaClient.producer.send({
        topic: "OrderCreatedEvent",
        messages: [{ value: JSON.stringify(orderCreatedEvent) }],
      });

      return new Success<string>(order.orderId);
    } catch (error) {
      return new Fail(
        error instanceof Error ? error : new Error("Failed to create order")
      );
    }
  }
}
