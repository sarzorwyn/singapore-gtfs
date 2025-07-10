import { generateGtfsStopTimes } from './bus/parseBusRouteApi';
import { fetchGtfsStops } from './bus/parseBusStopApi';
import { generateGtfsFrequencies, transformBusSvcApiDataToGtfs } from './bus/parseBusSvcApi';
import { GtfsExtrasFileCopier } from './lib/gtfsFileCopier';
import { writeGtfsFiles } from './writeGtfs';

const main = (async () => {
	const { routes, trips } = await transformBusSvcApiDataToGtfs();
	const stops = await fetchGtfsStops();
	const stopTimes = await generateGtfsStopTimes();
	const freqs = await generateGtfsFrequencies();
	await writeGtfsFiles({ routes, trips, stops, stopTimes, freqs });
	const copier = new GtfsExtrasFileCopier('./data/original-gtfs', './data/output-gtfs');
	await copier.copyStaticFiles();
	console.log('GTFS routes written.');
});

main().catch(console.error);
