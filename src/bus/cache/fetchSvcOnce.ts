// scripts/fetchStopsOnce.ts
import fs from 'fs-extra';
import path from 'path';
import { fetchAllBusServices } from '../parseBusSvcApi';

(async () => {
	const outPath = path.join(__dirname, './data/bus_services_cache.json');

	console.log('⏳ Fetching GTFS bus services...');
	const services = await fetchAllBusServices();
	await fs.writeJson(outPath, services, { spaces: 2 });

	console.log(`✅ Fetched ${services.length} services and saved to: ${outPath}`);
})();
