import 'dotenv/config';
import { GtfsStopTime, RawBusRoute } from "../types/types";
import path from 'path';
import fs from 'fs-extra';


const ROUTES_URL = 'https://datamall2.mytransport.sg/ltaodataservice/BusRoutes';
const API_KEY = process.env.LTA_ACCOUNT_KEY!;

const cachePath = path.join(__dirname, './cache/data/bus_routes_cache.json');


export async function fetchAllBusRoutes(): Promise<RawBusRoute[]> {
	const results: RawBusRoute[] = [];

	for (let skip = 0; ; skip += 500) {
		const res = await fetch(`${ROUTES_URL}?$skip=${skip}`, {
			headers: {
				AccountKey: API_KEY,
				accept: 'application/json'
			}
		});

		if (!res.ok) throw new Error(`Failed to fetch BusRoutes: ${res.statusText}`);
		const data = await res.json();
		const chunk: RawBusRoute[] = data.value;

		results.push(...chunk);
		if (chunk.length < 500) break;
	}

	return results;
}

function formatTime(hhmm: string): string {
	if (!/^\d{4}$/.test(hhmm)) return '00:00:00'; // fallback
	const hh = hhmm.slice(0, 2);
	const mm = hhmm.slice(2);
	return `${hh}:${mm}:00`;
}

export async function generateGtfsStopTimes(): Promise<GtfsStopTime[]> {
	let raw: RawBusRoute[];
    if (fs.existsSync(cachePath)) {
        console.log('⚡ Using cached bus services from file');
        raw = await fs.readJson(cachePath);
    } else {
	    raw = await fetchAllBusRoutes();    
    }


	const stopTimes: GtfsStopTime[] = [];

	for (const r of raw) {
		if (!r.WD_FirstBus || r.WD_FirstBus.length !== 4) continue;

		const direction_id = (Number(r.Direction) === 2) ? 1 : 0;
		const trip_id = `${r.ServiceNo}:WD:${direction_id}`;

		stopTimes.push({
			trip_id,
			arrival_time: formatTime(r.WD_FirstBus),
			departure_time: formatTime(r.WD_FirstBus),
			stop_id: r.BusStopCode,
			stop_sequence: r.StopSequence,
			shape_dist_traveled: r.Distance
		});
	}

	return stopTimes;
}