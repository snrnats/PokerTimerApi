import { Component, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { ApiService } from "@app/api.service";
import { Tournament } from "@app/models/tournament.model";
import { TournamentSetup } from "@app/models/tournament-setup.model";
import { max, min } from "rxjs/operators";
import { SetupLevel } from "@app/models/setup-level.model";
import { from } from "rxjs";
import { MatTableDataSource, MatSort, Sort, MatTable } from "@angular/material";

@Component({
    selector: "app-setups",
    templateUrl: "./setups.component.html"
})
export class SetupsComponent implements OnInit {

    setups: TournamentSetup[];
    dataSource: MatTableDataSource<TournamentSetup>;
    @ViewChild(MatSort) sort: MatSort;
    @ViewChild(MatTable) table: MatTable<TournamentSetup>;
    displayedColumns = ["title", "startingChips", "numberOfPlayers", "levelDuration", "initialBlinds", "actions"];
    constructor(private api: ApiService, private cdr: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.api.getSetups().subscribe(res => {
            this.dataSource = new MatTableDataSource(res);
            const defaultAccessor = this.dataSource.sortingDataAccessor;
            this.dataSource.sortingDataAccessor = ((data: TournamentSetup, sortHeaderId: string) => {
                switch (sortHeaderId) {
                    case "levelDuration":
                        return Math.min(...data.levels.map(s => s.duration));
                    case "initialBlinds":
                        return data.levels && data.levels[0] ? data.levels[0].smallBlind : 0;
                    default:
                        return defaultAccessor(data, sortHeaderId);
                }
            });
            this.dataSource.sort = this.sort;
            this.setups = res;
        });
    }

    getLevelDuration(setup: TournamentSetup): string {
        const durations = setup.levels.map(s => s.duration);
        const maxDuration = Math.max(...durations);
        const minDuration = Math.min(...durations);
        if (minDuration !== maxDuration) {
            return `${minDuration} - ${maxDuration}`;
        } else {
            return String(minDuration);
        }
    }

    getBlinds(setup: TournamentSetup): string {
        if (setup.levels && setup.levels[0]) {
            const level = setup.levels[0];
            return `${level.smallBlind} ${level.bigBlind} ${level.ante}`;
        }
        return "";
    }

    delete(setup: TournamentSetup): void {
        this.api.deleteSetup(setup.id).subscribe(res => {
            console.log(res);
            const index = this.dataSource.data.indexOf(setup);
            this.setups.splice(index, 1);
            this.dataSource.data = this.setups;
        });
    }

}
