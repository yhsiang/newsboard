import { aggregate } from "../helper/parser";
import { createJob } from "../job";

export async function execute(options) {
  try {
    const news = await aggregate(options);

    createJob(news);
  } catch (e) {
    console.log(e);
  }
}
