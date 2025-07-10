import 'dotenv/config';
import { GtfsRoute, GtfsTrip, RawBusService } from '../types/types';
import path from 'path';
import fs from 'fs-extra';

const BASE_URL = 'https://datamall2.mytransport.sg/ltaodataservice/BusServices';
const PAGE_SIZE = 500;
const API_KEY = process.env.LTA_ACCOUNT_KEY!;

const cachePath = path.join(__dirname, './cache/data/bus_services_cache.json');

// const mrtRoutes: GtfsRoute[] = [
// 	{ route_id: 'NS', agency_id: 'SMRT', route_short_name: 'NS MRT Line', route_long_name: 'NS Line', route_type: 1 },
// 	{ route_id: 'EW', agency_id: 'SMRT', route_short_name: 'EW MRT Line', route_long_name: 'EW Line', route_type: 1 },
// 	{ route_id: 'CG', agency_id: 'SMRT', route_short_name: 'CG MRT Line', route_long_name: 'CG Line', route_type: 1 },
// 	{ route_id: 'NE', agency_id: 'SBST', route_short_name: 'NE MRT Line', route_long_name: 'NE Line', route_type: 1 },
// 	{ route_id: 'CC', agency_id: 'SBST', route_short_name: 'CC MRT Line', route_long_name: 'CC Line', route_type: 1 },
// 	{ route_id: 'CE', agency_id: 'SBST', route_short_name: 'CE MRT Line', route_long_name: 'CE Line', route_type: 1 },
// 	{ route_id: 'DT', agency_id: 'SBST', route_short_name: 'DT MRT Line', route_long_name: 'DT Line', route_type: 1 },
// 	{ route_id: 'TE', agency_id: 'SBST', route_short_name: 'TE MRT Line', route_long_name: 'TE Line', route_type: 1 },
// 	{ route_id: 'SE', agency_id: 'LRT', route_short_name: 'SE LRT Line', route_long_name: 'SE Line', route_type: 0 },
// 	{ route_id: 'SW', agency_id: 'LRT', route_short_name: 'SW LRT Line', route_long_name: 'SW Line', route_type: 0 },
// 	{ route_id: 'PE', agency_id: 'LRT', route_short_name: 'PE LRT Line', route_long_name: 'PE Line', route_type: 0 },
// 	{ route_id: 'PW', agency_id: 'LRT', route_short_name: 'PW LRT Line', route_long_name: 'PW Line', route_type: 0 },
// 	{ route_id: 'BP', agency_id: 'LRT', route_short_name: 'BP LRT Line', route_long_name: 'BP Line', route_type: 0 },
// ];


export async function fetchAllBusServices(): Promise<RawBusService[]> {
	const results: RawBusService[] = [];

	for (let skip = 0; ; skip += PAGE_SIZE) {
		const res = await fetch(`${BASE_URL}?$skip=${skip}`, {
			headers: {
				AccountKey: API_KEY,
				accept: 'application/json'
			}
		});

		if (!res.ok) {
			throw new Error(`Fetch error: ${res.status}`);
		}

		const data = await res.json();
		const chunk: RawBusService[] = data.value;

		results.push(...chunk);
		if (chunk.length < PAGE_SIZE) break;
	}

	return results;
}

export async function transformBusSvcApiDataToGtfs(): Promise<{
	routes: GtfsRoute[];
	trips: GtfsTrip[];
}> {
	let services: RawBusService[];
	if (fs.existsSync(cachePath)) {
		console.log('⚡ Using cached bus services from file');
		services = await fs.readJson(cachePath);
	} else {
		services = await fetchAllBusServices();
	}

	const routes: GtfsRoute[] = [];
	const trips: GtfsTrip[] = [];

	for (const svc of services) {
		// Avoid duplicating routes by direction (LTA gives both dir 1 and 2)
		if (!routes.some((r) => r.route_id === svc.ServiceNo)) {
			routes.push({
				route_id: svc.ServiceNo,
				agency_id: svc.Operator,
				route_short_name: svc.ServiceNo,
				route_type: 3
			});
		}

		const direction_id = svc.Direction === '2' ? 1 : 0;
		const service_id = 'WD';

		trips.push({
			trip_id: `${svc.ServiceNo}:${service_id}:${direction_id}`,
			route_id: svc.ServiceNo,
			service_id,
			direction_id
		});
	}

	return { routes, trips };
}
