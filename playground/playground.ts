import { Event, MetricRegistry, Timer } from "inspector-metrics";
import { ElasticsearchMetricReporter } from "../lib/metrics";

const reporter: ElasticsearchMetricReporter = new ElasticsearchMetricReporter({
    clientOptions: {
        apiVersion: "6.0",
        host: "localhost:9200",
    },
});
const registry: MetricRegistry = new MetricRegistry();
const requests1: Timer = registry.newTimer("requests1");
const requests2: Timer = registry.newTimer("requests2");
const requests3: Timer = registry.newTimer("requests3");

requests1.setGroup("requests");
requests2.setGroup("requests");

requests1.setTag("host", "127.0.0.1");
requests2.setTag("host", "127.0.0.2");
requests3.setTag("host", "127.0.0.3");

// quick & dirty hack ...
global.console.debug = global.console.info;
reporter.setLog(null);
reporter.addMetricRegistry(registry);

const event = new Event<number>("application_started")
    .setValue(1.0)
    .setTag("mode", "test")
    .setTag("customTag", "specialValue");

try {
    reporter.reportEvent(event);
} catch (e) {
    // tslint:disable-next-line:no-console
    console.log(e);
}

(async () => {
    await reporter.start();

    function noop(x: any) {
    }

    setInterval(() => {
        requests1.time(() => {
            let a = 0;
            const b = 1;
            for (let i = 0; i < 1e6; i++) {
                a = b + i;
            }
            noop(a);
        });
    }, 100);

    setInterval(() => {
        requests2.time(() => {
            let a = 0;
            const b = 1;
            for (let i = 0; i < 1e6; i++) {
                a = b + i;
            }
            noop(a);
        });
    }, 50);

    setInterval(() => {
        requests3.time(() => {
            let a = 0;
            const b = 1;
            for (let i = 0; i < 1e6; i++) {
                a = b + i;
            }
            noop(a);
        });
    }, 25);
})();
