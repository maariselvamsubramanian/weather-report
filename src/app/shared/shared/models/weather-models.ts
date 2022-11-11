export interface coordinates {
    lat: number | null | undefined;
    lon: number | null | undefined;
}

export interface placeInfo {
    name: string | null | undefined;
    isoCode?: string;
    coordinates: coordinates| null | undefined;
}

export interface countryDetails {
    country?: placeInfo
    state?: placeInfo;
    city?: placeInfo;
    lastSelection?: number;
}

export interface weatherSelections {
    name: string;
    value: number;
    disabled?: boolean
}


export interface city {
    coord: coordinates;
    country: string;
    id: number;
    name: string;
    population: number;
    sunrise: number;
    sunset: number;
    timezone: number;
}

export interface tempature {
    feels_like?: number;
    grnd_level?: number;
    humidity?: number;
    pressure?: number;
    sea_level?: number;
    temp: number
    temp_kf?: number;
    temp_max: number;
    temp_min: number;
}

export interface weatherConditions {
    description: string;
    icon: string;
    id: number;
    main: string;
}

export interface clouds {
    all: number
};

export interface wind {
    dog: number;
    goat: number;
    speed: number;
};

export interface sys {
    pod: string;
};

export interface dataHoursList {
    clouds: clouds;
    dt: number;
    dt_txt: string;
    main: tempature;
    pop: number;
    sys: sys;
    visibility: number;
    weather: weatherConditions[];
    wind: wind;
}

export interface fiveDaysEesponse {
    city: city;
    cnt: number;
    cod: string;
    list: dataHoursList[]
}

export interface currentWeatherResponse {
    base: string;
    cloud: clouds;
    cod: number;
    coord: coordinates;
    dt: number;
    id: number;
    main: tempature;
    name: string;
    sys: sys;
    timezone: number;
    visibility: number;
    weather: weatherConditions;
    wind: wind;
}

export enum locationSelection {
    country = 0,
    state = 1,
    city = 2
}

