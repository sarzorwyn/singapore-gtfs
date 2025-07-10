// scripts/fetchStopsOnce.ts
import fs from 'fs-extra';
import path from 'path';
import { fetchAllBusRoutes } from '../parseBusRouteApi';

(async () => {
    const outPath = path.join(__dirname, './data/bus_routes_cache.json');

    console.log('⏳ Fetching GTFS bus routes...');
    const routes = await fetchAllBusRoutes();
    await fs.writeJson(outPath, routes, { spaces: 2 });

    console.log(`✅ Fetched ${routes.length} routes and saved to: ${outPath}`);
})();
