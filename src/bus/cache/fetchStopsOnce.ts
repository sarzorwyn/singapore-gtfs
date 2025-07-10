// scripts/fetchStopsOnce.ts
import fs from 'fs-extra';
import path from 'path';
import { fetchAllBusStops } from '../parseBusStopApi';

(async () => {
	const outPath = path.join(__dirname, './data/bus_stops_cache.json');

	console.log('⏳ Fetching GTFS bus stops...');
	const stops = await fetchAllBusStops();
	await fs.writeJson(outPath, stops, { spaces: 2 });

	console.log(`✅ Fetched ${stops.length} stops and saved to: ${outPath}`);
})();
