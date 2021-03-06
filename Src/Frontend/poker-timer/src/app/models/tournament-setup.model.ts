import { SetupLevel } from "@app/models/setup-level.model";

export interface TournamentSetup {
    id: number;
    title: string;
    ownerId: string;
    startingChips: number;
    numberOfPlayers: number;
    isInfinite: boolean;
    infiniteMultiplier: number;
    levels: SetupLevel[];
}
