export type RawBusService = {
    ServiceNo: string;
    Operator: string;
    Direction: string;
    Category: string;
    OriginCode: string;
    DestinationCode: string;
    AM_Peak_Freq: string;
    AM_Offpeak_Freq: string;
    PM_Peak_Freq: string;
    PM_Offpeak_Freq: string;
    LoopDesc: string;
};

export type RawBusStop = {
	BusStopCode: string;
	RoadName: string;
	Description: string;
	Latitude: number;
	Longitude: number;
};

export type GtfsRoute = {
    route_id: string;
    agency_id: string;
    route_short_name: string;
    route_type: number;
};

export type GtfsTrip = {
	trip_id: string;
	shape_id: string;
	route_id: string;
	service_id: string;
	direction_id: number;
};

export type GtfsStop = {
	stop_id: string;
	stop_name: string;
	stop_lat: number;
	stop_lon: number;
};

export type RawBusRoute = {
	ServiceNo: string;
	Direction: string;
	StopSequence: number;
	BusStopCode: string;
	Distance: number;
	WD_FirstBus: string;
	WD_LastBus: string;
};

export type GtfsStopTime = {
	trip_id: string;
	arrival_time: string;
	departure_time: string;
	stop_id: string;
	stop_sequence: number;
	shape_dist_traveled: number;
};

export type GtfsFrequency = {
	trip_id: string;
	start_time: string;
	end_time: string;
	headway_secs: number;
};
