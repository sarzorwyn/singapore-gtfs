import { generateGtfsStopTimes } from './bus/parseBusRouteApi';
import { fetchGtfsStops } from './bus/parseBusStopApi';
import { generateGtfsFrequencies, transformBusSvcApiDataToGtfs } from './bus/parseBusSvcApi';
import { GtfsExtrasFileCopier } from './lib/gtfsFileCopier';
import { extractMrtFrequencies } from './mrt/extractMrtFrequencies';
import { extractMrtRoutes } from './mrt/extractMrtRoutes';
import { extractMrtStops } from './mrt/extractMrtStops';
import { extractMrtStopTimes } from './mrt/extractMrtStopTimes';
import { extractMrtTrips } from './mrt/extractMrtTrips';
import { writeGtfsFiles } from './writeGtfs';

const main = (async () => {
	// Bus
	const { routes, trips } = await transformBusSvcApiDataToGtfs();
	const stops = await fetchGtfsStops();
	const stopTimes = await generateGtfsStopTimes();
	const freqs = await generateGtfsFrequencies();
	await writeGtfsFiles({ routes, trips, stops, stopTimes, freqs });
	const copier = new GtfsExtrasFileCopier('./data/original-gtfs', './data/output-gtfs');
	await copier.copyStaticFiles();

	// MRT
	extractMrtRoutes();
	extractMrtStops();
	extractMrtTrips();
	extractMrtStopTimes();
	extractMrtFrequencies();

	console.log('GTFS routes written.');
});

main().catch(console.error);
