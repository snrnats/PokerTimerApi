import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from "@angular/forms";
import { ApiService } from "@app/api.service";
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { Observable } from "rxjs";
import { TournamentSetup } from "@app/models/tournament-setup.model";
import { SetupLevel } from "@app/models/setup-level.model";

@Component({
  selector: "app-setup-edit",
  templateUrl: "./setup-edit.component.html",
  styleUrls: ["./setup-edit.component.css"]
})
export class SetupEditComponent implements OnInit {

  private id: number;
  form: FormGroup;
  constructor(private fb: FormBuilder, private api: ApiService, private route: ActivatedRoute, private router: Router) { }

  get levels(): FormArray {
    return this.form.get("levels") as FormArray;
  }

  ngOnInit() {
    this.route.paramMap.pipe(switchMap((params: ParamMap) => {
      if (params.has("id")) {
        const id = Number(params.get("id"));
        return this.api.getSetup(id);
      }
      return new Observable<TournamentSetup>(sub => sub.next({
        id: null,
        title: null,
        startingChips: null,
        numberOfPlayers: null,
        isInfinite: false,
        levels: []
      }));
    })).subscribe(res => {
      this.id = res.id;
      this.form = this.fb.group({
        title: [res.title, [Validators.required]],
        startingChips: [res.startingChips, [Validators.required]],
        numberOfPlayers: [res.numberOfPlayers, [Validators.required]],
        isInfinite: [res.isInfinite, [Validators.required]],
        levels: this.fb.array(res.levels.map(this.getLevelGroup, this))
      });
    });
  }

  getLevelGroup(level: SetupLevel): FormGroup {
    return this.fb.group({
      duration: [level.duration, [Validators.required, Validators.min(0)]],
      smallBlind: [level.smallBlind, [Validators.required, Validators.min(0)]],
      bigBlind: [level.bigBlind, [Validators.required, Validators.min(0)]],
      ante: [level.ante, [Validators.required, Validators.min(0)]],
    });
  }

  submit(): void {
    if (this.id !== null) {
      this.api.updateSetup(Object.assign({ id: this.id }, this.form.value)).subscribe(res => {
        this.router.navigateByUrl(`/setups/${this.id}`);
      });
    } else {
      this.api.createSetup(this.form.value).subscribe(res => {
        this.router.navigateByUrl(`/setups/${res.id}`);
      });
    }
  }

  onAdded(): void {
    this.levels.push(this.getLevelGroup({ duration: 0, smallBlind: 0, bigBlind: 0, ante: 0 }));
  }

  removeLevel(index: number) {
    this.levels.removeAt(index);
  }

}
