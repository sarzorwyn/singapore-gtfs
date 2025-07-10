import 'dotenv/config';
import { GtfsFrequency, GtfsRoute, GtfsTrip, RawBusService } from '../types/types';
import path from 'path';
import fs from 'fs-extra';

const BASE_URL = 'https://datamall2.mytransport.sg/ltaodataservice/BusServices';
const PAGE_SIZE = 500;
const API_KEY = process.env.LTA_ACCOUNT_KEY!;

const cachePath = path.join(__dirname, './cache/data/bus_services_cache.json');

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
		console.log('⚡ Using cached bus services from file to generate routes and trips');
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

function parseFreqRange(freqStr: string): number | null {
	if (!freqStr.includes('-')) return null;
	const [minStr, maxStr] = freqStr.split('-').map(s => parseInt(s.trim(), 10));
	if (isNaN(minStr) || isNaN(maxStr)) return null;
	return Math.round(((minStr + maxStr) / 2) * 60); // → seconds
}

export async function generateGtfsFrequencies(): Promise<GtfsFrequency[]> {
	const timeBlocks = [
		{ field: 'AM_Offpeak_Freq', start: '05:00:00', end: '06:30:00' },
		{ field: 'AM_Peak_Freq',     start: '06:30:00', end: '08:30:00' },
		{ field: 'AM_Offpeak_Freq', start: '08:30:00', end: '17:00:00' },
		{ field: 'PM_Peak_Freq',     start: '17:00:00', end: '19:00:00' },
		{ field: 'PM_Offpeak_Freq', start: '19:00:00', end: '25:00:00' }
	];

	let services: RawBusService[];
	if (fs.existsSync(cachePath)) {
		console.log('⚡ Using cached bus services from file to generate frequencies');
		services = await fs.readJson(cachePath);
	} else {
		services = await fetchAllBusServices();
	}

	const frequencies: GtfsFrequency[] = [];

	for (const svc of services) {
		const direction_id = (Number(svc.Direction) === 2) ? 1 : 0;
		const trip_id = `${svc.ServiceNo}:WD:${direction_id}`;

		for (const block of timeBlocks) {
			const headway_secs = parseFreqRange((svc as any)[block.field]);
			if (headway_secs == null) continue;

			frequencies.push({
				trip_id,
				start_time: block.start,
				end_time: block.end,
				headway_secs
			});
		}
	}

	return frequencies;
}
