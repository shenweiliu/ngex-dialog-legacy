import { Component } from '@angular/core';
import { ExDialog } from "ngex-dialog";

@Component({
    moduleId: module.id.toString(),
    selector: 'sample-second',
    templateUrl: "./sample-second.component.html"
})
export class SampleSecondComponent {
    
    constructor(private exDialog: ExDialog) { }    
    
    openSimpleInfo() {    
        this.exDialog.openMessage("Open a dialog on second page.");
    }    
}
