import { flatten, groupBy, sumBy } from 'lodash-es';
import type { Vector } from './Vector';

export type BattleRecord = {
	num: number;
	planetNum?: number;
	position: Vector;
	tokens: Token[];
	actionsPerRound: Array<TokenAction[]>;
};

export type Token = {
	num: number;
	playerNum: number;
	designNum: number;
	position: Vector;
	startingDamage?: number;
	startingQuantityDamaged?: number;
	initiative?: number;
	movement?: number;
	tactic: BattleTactic | string;
	primaryTarget: BattleTarget | string;
	secondaryTarget: BattleTarget | string;
	attackWho: BattleAttackWho | string;
};

export type TokenAction = {
	type: number;
	tokenNum: number;
	round: number;
	from: Vector;
	to: Vector;
	slot?: number;
	targetNum?: number;
	target?: Token;
	tokensDestroyed?: number;
	damageDoneShields?: number;
	damageDoneArmor?: number;
	torpedoHits?: number;
	torpedoMisses?: number;
};

export enum BattleTactic {
	Disengage = 'Disengage',
	DisengageIfChallenged = 'DisengageIfChallenged',
	MinimizeDamageToSelf = 'MinimizeDamageToSelf',
	MaximizeNetDamage = 'MaximizeNetDamage',
	MaximizeDamageRatio = 'MaximizeDamageRatio',
	MaximizeDamage = 'MaximizeDamage'
}

export enum BattleTarget {
	None = '',
	Any = 'Any',
	Starbase = 'Starbase',
	ArmedShips = 'ArmedShips',
	BombersFreighters = 'BombersFreighters',
	UnarmedShips = 'UnarmedShips',
	FuelTransports = 'FuelTransports',
	Freighters = 'Freighters'
}

export enum BattleAttackWho {
	Enemies = 'Enemies',
	EnemiesAndNeutrals = 'EnemiesAndNeutrals',
	Everyone = 'Everyone'
}
export enum TokenActionType {
	Fire,
	BeamFire,
	TorpedoFire,
	Move,
	RanAway
}

// a phase token is a token combined with a position
export type PhaseToken = {
	action?: TokenAction;
	ranAway?: boolean;
	destroyed?: boolean;
} & Token &
	Vector;

type TokensByLocation = Record<string, PhaseToken[]>;

export class Battle implements BattleRecord {
	constructor(public num: number, public position: Vector, record?: BattleRecord) {
		Object.assign(this, record);
		this.totalPhases = sumBy(this.actionsPerRound, (a) => a.length);
		this.totalRounds = this.actionsPerRound.length;
		this.tokensByPhase = this.getPhaseTokensForBattle();
		this.tokens.sort((a, b) => a.num - b.num);
		this.actions = flatten(this.actionsPerRound);
	}

	planetNum?: number | undefined;
	tokens: Token[] = [];
	actionsPerRound: TokenAction[][] = [];
	actions: TokenAction[] = [];
	totalPhases: number;
	totalRounds: number;

	private tokensByPhase: TokensByLocation[];

	getToken(num: number): Token | undefined {
		if (num > 0 && num <= this.tokens.length) {
			return this.tokens[num - 1];
		}
	}

	// get all remaining tokens at a location for a phase
	getTokensAtLocation(phase: number, x: number, y: number): PhaseToken[] | undefined {
		const phaseTokens = this.tokensByPhase[phase];
		return (
			phaseTokens &&
			phaseTokens[getTokenLocationKey(x, y)]?.filter((t) => !(t.ranAway || t.destroyed))
		);
	}

	getActionToken(phase: number): PhaseToken | undefined {
		return flatten(Object.values(this.tokensByPhase[phase])).find((t) => t.action);
	}

	getActionForPhase(phase: number) {
		return this.getActionToken(phase)?.action;
	}

	private getPhaseTokensForBattle(): TokensByLocation[] {
		const tokensByPhase: TokensByLocation[] = [];

		// starting token configuration
		let tokens: PhaseToken[] = this.tokens.map((t) => ({
			...t,
			x: t.position.x,
			y: t.position.y
		}));

		// set the first phase to our base tokens
		tokensByPhase.push(groupBy(tokens, (t) => getTokenLocationKey(t.x, t.y)));

		for (let round = 1; round < this.actionsPerRound.length; round++) {
			const roundActions = this.actionsPerRound[round];
			for (let actionIndex = 0; actionIndex < roundActions.length; actionIndex++) {
				// find the action for this phase
				const action = roundActions[actionIndex];
				const phaseTokens = tokens.map((t) => {
					// clone each token for this phase
					const clonedToken = structuredClone(t);

					// if this token is being acted upon, update it
					if (clonedToken.num == action.tokenNum) {
						clonedToken.action = action;
						if (action.type == TokenActionType.Move) {
							clonedToken.x = action.to?.x ?? clonedToken.x;
							clonedToken.y = action.to?.y ?? clonedToken.y;
						} else if (action.type == TokenActionType.RanAway) {
							clonedToken.ranAway = true;
						}
					} else {
						// this token is idle, remove the action
						clonedToken.action = undefined;
					}
					return clonedToken;
				});
				// keep track of our progress
				tokens = phaseTokens;
				tokensByPhase.push(groupBy(phaseTokens, (t) => getTokenLocationKey(t.x, t.y)));
			}
		}

		return tokensByPhase;
	}
}

export const getTokenLocationKey = (x: number, y: number): string => `${x}-${y}`;
