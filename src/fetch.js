import { execute } from "./crawler/executor";
import * as apple from "./sites/appledaily";
import * as udn from "./sites/udn";
import * as ltn from "./sites/ltn";
import * as chinatimes from "./sites/chinatimes";
import * as ettoday from "./sites/ettoday";
import * as setn from "./crawler/setn";

execute(apple);
execute(udn);
execute(ltn);
execute(chinatimes);
execute(ettoday);
setn.execute();
