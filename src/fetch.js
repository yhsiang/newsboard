import { execute } from "./crawler/executor";
import * as apple from "./sites/appledaily";
import * as udn from "./sites/udn";
import * as ltn from "./sites/ltn";
import * as chinatimes from "./sites/chinatimes";

execute(apple);
execute(udn);
execute(ltn);
execute(chinatimes);
