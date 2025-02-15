import { QueryBus } from "../../shared/cqrs";
import { GetOrderHandler } from "./get-order.handle";
import { GetOrderQuery } from "./get-order.query";

const orderQueryBus = new QueryBus();
orderQueryBus.register(GetOrderQuery, new GetOrderHandler());

export { orderQueryBus };
