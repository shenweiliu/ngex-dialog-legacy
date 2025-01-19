import { Component, ViewContainerRef, ViewChild, ComponentFactoryResolver, ReflectiveInjector, Type, HostListener, ElementRef, OnInit } from '@angular/core';
import { DialogComponent } from './dialog.component';
import { AlignmentDirective } from './alignment.directive';
import { NgExDialogConfig } from './dialog-config';

@Component({    
    moduleId: module.id.toString(),
    selector: 'dialog-main',
    templateUrl: 'dialog-main.component.html'
})
export class DialogMainComponent implements OnInit {
    
    config: any = undefined;
    shown: boolean = false;
    content!: DialogComponent;
    dialogPaddingTop: number = 0;

    //Angular CLI 12 TypeScript strictPropertyInitialization impact:
    //1. When possible, give it a default value: @Input() user: UserModel = defaultUser
    //2. Explicitly mark the field as possibly undefined: @Input() user: UserModel | undefined
    //3. Add a non - null assertion if you don’t want to bother: @Input() user!: UserModel

    @ViewChild(AlignmentDirective, { static: true }) alignmentDirective!: AlignmentDirective;
    @ViewChild('element', { static: true, read: ViewContainerRef }) private element!: ViewContainerRef;
    @ViewChild('dialogMainElem', { static: true }) dialogMainElem!: ElementRef;
    
    constructor(private resolver: ComponentFactoryResolver, private ngExDialogConfig: NgExDialogConfig)
    { }

    ngOnInit(): void {
        if (this.content.basicType == 'prime') {
            this.alignmentDirective.isPrimeType = true;
        }
        //Set for start position based on cursor point if used.
        if (this.content.initElement) {
            this.alignmentDirective.setPosition = {
                initElement: this.content.initElement,                
                h_Offset: this.content.h_Offset,
                v_Offset: this.content.v_Offset,
                h_event: this.content.h_event,
                v_event: this.content.v_event 
            };
        }
        //Pass caller-provided or configured top offset value to alignmentDirective.
        this.alignmentDirective.topOffset = this.content.topOffset == undefined ? this.ngExDialogConfig.merged.topOffset : this.content.topOffset;
    }

    /**
    * Creates and add to DOM main dialog (overlay) parent component
    * @return {DialogHostComponent}
    */
    addComponent(component: Type<DialogComponent>) {
        let factory: any = this.resolver.resolveComponentFactory(component);
        let injector: any = ReflectiveInjector.fromResolvedProviders([], this.element.injector);
        let componentRef: any = factory.create(injector);
        this.element.insert(componentRef.hostView);
        this.content = <DialogComponent>componentRef.instance;
        this.content.dialogMain = this;
        return this.content;
    }

    //Setting values for directives used in this component view.
    //draggable setting is used in ng2-draggable directive code.
    dialogWidth: string = '0';
    isGrayBackground: boolean = false;    
    isAnimation: boolean = false; 
    isDraggable: boolean = false;
    //topOffset: number = 0;

    show(): void {
        this.config = this.ngExDialogConfig.merged;

        //Check and overwrite default settings by dialog-level custom configs.
        this.dialogWidth = this.content.width == '0' ? this.config.width : this.content.width;
        if (this.content.width == '0') this.content.width = this.dialogWidth;
                
        this.isGrayBackground = this.content.grayBackground == false ? this.config.grayBackground : this.content.grayBackground;
        if (this.content.grayBackground == false) this.content.grayBackground = this.isGrayBackground;

        this.isAnimation = this.content.animation == false ? this.config.animation : this.content.animation;
        if (this.content.animation == false) this.content.animation = this.isAnimation;

        this.isDraggable = this.content.draggable == false ? this.config.draggable : this.content.draggable;
        if (this.content.draggable == false) this.content.draggable = this.isDraggable;

        if (this.content.closeByEnter == false) this.content.closeByEnter = this.config.closeByEnter;
        if (this.content.closeByEscape == false) this.content.closeByEscape = this.config.closeByEscape;
        if (this.content.closeByClickOutside == false) this.content.closeByClickOutside = this.config.closeByClickOutside;
        if (this.content.closeAllDialogs == false) this.content.closeAllDialogs = this.config.closeAllDialogs;
        if (this.content.closeImmediateParent == false) this.content.closeImmediateParent = this.config.closeImmediateParent;
        
        if (this.content.keepOpenForAction == false) this.content.keepOpenForAction = this.config.keepOpenForAction;
        if (this.content.keepOpenForClose == false) this.content.keepOpenForClose = this.config.keepOpenForClose;

        if (this.content.closeDelay == 0) this.content.closeDelay = this.config.closeDelay;
        if (this.content.closeDelayParent == 0) this.content.closeDelayParent = this.config.closeDelayParent;

        //For basic type dialogs only.
        if (this.content.showIcon == false && !this.content.showIcon) this.content.showIcon = this.config.showIcon;
        if (this.content.basicType == 'message') {
            if (this.content.title == '') this.content.title = this.config.messageTitle;
            if (this.content.showIcon)
                if (this.content.icon == '') this.content.icon = this.config.messageIcon;
            if (this.content.closeButtonLabel == '') {
                this.content.closeButtonLabel = this.config.messageCloseButtonLabel;
                //Use action button pattern if no value for closeButtonLabel.
                if (this.content.actionButtonLabel == '') {
                    this.content.actionButtonLabel = this.config.messageActionButtonLabel;
                }
            }
        }
        else if (this.content.basicType == 'confirm') {
            if (this.content.title == '') this.content.title = this.config.confirmTitle;
            if (this.content.showIcon)
                if (this.content.icon == '') this.content.icon = this.config.confirmIcon;
            if (this.content.actionButtonLabel == '') this.content.actionButtonLabel = this.config.confirmActionButtonLabel;
            if (this.content.closeButtonLabel == '') this.content.closeButtonLabel = this.config.confirmCloseButtonLabel;
        }
        
        this.shown = true;
    }

    hide():void {
        this.shown = false;
    }

    clickOutside(event: any) {      
        if (this.content.closeByClickOutside && event.target.classList.contains('dialog-frame')) {
            this.content.dialogResult();
        }      
    }    

    //Press Esc or Enter key to close dialog.
    @HostListener('window:keydown', ['$event'])
    keyboardInput(event: any) {
        //event.preventDefault();
        event.stopPropagation();
        if ((this.content.closeByEnter && event.keyCode == 13) ||
            (this.content.closeByEscape && event.keyCode == 27)) {
            this.content.dialogResult();
        }
    }
}
