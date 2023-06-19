// Generated by https://quicktype.io

import type { Cargo } from './Cargo';
import type { Cost } from './Cost';
import type { MapObject } from './MapObject';
import type { Vector } from './Vector';

export interface Fleet extends MapObject {
	baseName: string;
	fuel: number;
	cargo: Cargo;
	damage: number;
	battlePlan: number;
	tokens: ShipToken[];
	waypoints: Waypoint[];
	spec: Spec;
}

export interface ShipToken {
	id: number;
	createdAt: string;
	updatedat: string;

	gameId: number;
	designId: number;
	quantity: number;
}

export interface Waypoint {
	position: Vector;
	targetPlanetNum: number;
	targetName: string;
}

export interface Spec {
	cost: Cost;
	mass: number;
	armor: number;
	fuelCapacity: number;
	immuneToOwnDetonation: boolean;
	mineLayingRateByMineType: null;
	weaponSlots: null;
	purposes: string[];
	totalShips: number;
	massEmpty: number;
	basePacketSpeed: number;
	safePacketSpeed: number;
	baseCloakedCargo: number;
	stargate: string;

	idealSpeed: number;
	engine: number;
	numEngines: number;
	cargoCapacity: number;
	cloakUnits: number;
	scanRange: number;
	scanRangePen: number;
	repairBonus: number;
	torpedoInaccuracyFactor: number;
	initiative: number;
	movement: number;
	powerRating: number;
	bomber: number;
	bombs: number;
	smartBombs: number;
	retroBombs: number;
	scanner: number;
	shield: number;
	colonizer: number;
	canLayMines: number;
	spaceDock: number;
	miningRate: number;
	terraformRate: number;
	mineSweep: number;
	cloakPercent: number;
	reduceCloaking: number;
	canStealFleetCargo: number;
	canStealPlanetCargo: number;
	orbitalConstructionModule: number;
	hasWeapons: boolean;
	hasStargate: boolean;
	hasMassDriver: boolean;
}
