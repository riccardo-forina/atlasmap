/*
    Copyright (C) 2017 Red Hat, Inc.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
*/

import { Component, Input, ViewChildren, ElementRef, QueryList, ViewChild } from '@angular/core';

import { ConfigModel } from '../models/config.model';
import { Field } from '../models/field.model';
import { DocumentDefinition } from '../models/document.definition.model';

import { DocumentFieldDetailComponent } from './document.field.detail.component';
import { PropertyFieldEditComponent } from './property.field.edit.component';
import { ConstantFieldEditComponent } from './constant.field.edit.component';
import { FieldEditComponent } from './field.edit.component';

import { LineMachineComponent } from './line.machine.component';
import { ModalWindowComponent } from './modal.window.component';

@Component({
    selector: 'document-definition',
    template: `
        <div #documentDefinitionElement class='docDef' *ngIf="cfg && cfg.initCfg.initialized">
            <div class="card-pf">
                <div class="card-pf-heading">
                    <h2 class="card-pf-title">
                        <div class="docName">
                            <i class="fa {{ isSource ? 'fa-hdd-o' : 'fa-download' }}"></i>
                            <label>{{ getSourcesTargetsLabel() }}</label>
                        </div>
                        <i (click)="toggleSearch()" [attr.class]="getSearchIconCSSClass()"></i>
                        <div class="clear"></div>
                    </h2>

                </div>
                <div *ngIf="searchMode" class="searchBox">
                    <input type="text" #searchFilterBox
                        id="search-filter-box" (keyup)="search(searchFilterBox.value)" placeholder="Search"
                        [(ngModel)]="searchFilter" />
                    <i class="fa fa-close searchBoxCloseIcon link" (click)="toggleSearch()"></i>
                    <div class="clear"></div>
                </div>
                <div [attr.class]="searchMode ? 'fieldListSearchOpen' : 'fieldList'" style="overflow:auto;"
                    (scroll)="handleScroll($event)">
                    <div *ngFor="let docDef of cfg.getDocs(isSource)" #docDetail class="docIdentifier" [attr.id]='docDef.name'>
                        <div class="card-pf-title documentHeader" tooltip="{{ docDef.fullyQualifiedName }}" placement="bottom"
                            *ngIf="isDocNameVisible(docDef)" (click)="toggleFieldVisibility(docDef)">
                            <div style="float:left">
                                <i class="fa fa-angle-right docCollapseIcon" *ngIf="!docDef.showFields"></i>
                                <i class="fa fa-angle-down docCollapseIcon" *ngIf="docDef.showFields"></i>
                                <i class="fa {{ isSource ? 'fa-hdd-o' : 'fa-download' }}"></i>
                                <label>{{ docDef.getName(cfg.showTypes) }}</label>
                            </div>
                            <div style="float:right;" *ngIf="isAddFieldAvailable(docDef)">
                                <i class="fa fa-plus link" (click)="addField(docDef, $event)"></i>
                            </div>
                            <div class="clear"></div>
                        </div>
                        <div *ngIf="docDef.showFields">
                            <document-field-detail #fieldDetail *ngFor="let f of docDef.fields" [modalWindow]="modalWindow"
                                [field]="f" [cfg]="cfg" [lineMachine]="lineMachine"></document-field-detail>
                            <div class="FieldDetail"
                                *ngIf="!searchMode && docDef.initCfg.type.isPropertyOrConstant() && !docDef.fields.length">
                                <label style="width:100%; padding:5px 16px; margin:0">
                                    No {{ docDef.initCfg.type.isProperty() ? 'properties' : 'constants' }} exist.
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="noSearchResults" *ngIf="searchMode && !searchResultsExist">
                        <label>No search results.</label>
                    </div>
                </div>
                <div class="card-pf-heading fieldsCount">{{ getFieldCount() }} fields</div>
            </div>
        </div>
    `,
})

export class DocumentDefinitionComponent {
    @Input() cfg: ConfigModel;
    @Input() isSource = false;
    @Input() lineMachine: LineMachineComponent;
    @Input() modalWindow: ModalWindowComponent;

    @ViewChild('documentDefinitionElement') documentDefinitionElement: ElementRef;
    @ViewChildren('fieldDetail') fieldComponents: QueryList<DocumentFieldDetailComponent>;
    @ViewChildren('docDetail') docElements: QueryList<ElementRef>;

    private searchMode = false;
    private searchFilter = '';
    private scrollTop = 0;
    private searchResultsExist = false;

    public getDocDefElementPosition(docDef: DocumentDefinition): any {
        for (const c of this.docElements.toArray()) {
            if (c.nativeElement.id == docDef.name) {
                const documentElementAbsPosition: any = this.getElementPositionForElement(c.nativeElement, false, true);
                const myElement: any = this.documentDefinitionElement.nativeElement;
                const myAbsPosition: any = this.getElementPositionForElement(myElement, false, false);
                return { 'x': (documentElementAbsPosition.x - myAbsPosition.x),
                         'y': (documentElementAbsPosition.y - myAbsPosition.y) };
            }
        }
        return null;
    }

    public getFieldDetailComponent(field: Field): DocumentFieldDetailComponent {
        for (const c of this.fieldComponents.toArray()) {
            const returnedComponent: DocumentFieldDetailComponent = c.getFieldDetailComponent(field);
            if (returnedComponent != null) {
                return returnedComponent;
            }
        }
        return null;
    }

    public getElementPosition(): any {
        return this.getElementPositionForElement(this.documentDefinitionElement.nativeElement, true, false);
    }

    public getElementPositionForElement(el: any, addScrollTop: boolean, subtractScrollTop: boolean): any {
        let x = 0;
        let y = 0;

        while (el != null) {
            x += el.offsetLeft;
            y += el.offsetTop;
            el = el.offsetParent;
        }
        if (addScrollTop) {
            y += this.scrollTop;
        }
        if (subtractScrollTop) {
            y -= this.scrollTop;
        }
        return { 'x': x, 'y': y };
    }

    public getFieldDetailComponentPosition(field: Field): any {
        const c: DocumentFieldDetailComponent = this.getFieldDetailComponent(field);
        if (c == null) {
            return null;
        }
        const fieldElementAbsPosition: any = c.getElementPosition();
        const myAbsPosition: any = this.getElementPosition();
        return { 'x': (fieldElementAbsPosition.x - myAbsPosition.x), 'y': (fieldElementAbsPosition.y - myAbsPosition.y) };
    }

    public getSearchIconCSSClass(): string {
        const cssClass = 'fa fa-search searchBoxIcon link';
        return this.searchMode ? (cssClass + ' selectedIcon') : cssClass;
    }

    private getSourcesTargetsLabel(): string {
        if (this.isSource) {
            return 'Sources';
        } else {
            return (this.cfg.targetDocs.length > 1) ? 'Targets' : 'Target';
        }
    }

    private isAddFieldAvailable(docDef: DocumentDefinition): boolean {
        return docDef.initCfg.type.isPropertyOrConstant()
            || (!docDef.isSource && docDef.initCfg.type.isJSON())
            || (!docDef.isSource && docDef.initCfg.type.isXML());
    }

    private isDocNameVisible(docDef: DocumentDefinition): boolean {
        if (this.searchMode && !docDef.visibleInCurrentDocumentSearch) {
            return false;
        }
        return true;
    }

    private toggleFieldVisibility(docDef: DocumentDefinition): void {
        docDef.showFields = !docDef.showFields;
        setTimeout(() => {
            this.lineMachine.redrawLinesForMappings();
        }, 10);
    }

    private getFieldCount(): number {
        let count = 0;
        for (const docDef of this.cfg.getDocs(this.isSource)) {
            if (docDef && docDef.allFields) {
                count += docDef.allFields.length;
            }
        }
        return count;
    }

    private search(searchFilter: string): void {
        this.searchResultsExist = false;
        const searchIsEmpty: boolean = (searchFilter == null) || ('' == searchFilter);
        const defaultVisibility: boolean = searchIsEmpty ? true : false;
        for (const docDef of this.cfg.getDocs(this.isSource)) {
            docDef.visibleInCurrentDocumentSearch = defaultVisibility;
            for (const field of docDef.getAllFields()) {
                field.visibleInCurrentDocumentSearch = defaultVisibility;
            }
            if (!searchIsEmpty) {
                for (const field of docDef.getTerminalFields()) {
                    field.visibleInCurrentDocumentSearch = field.name.toLowerCase().includes(searchFilter.toLowerCase());
                    this.searchResultsExist = this.searchResultsExist || field.visibleInCurrentDocumentSearch;
                    if (field.visibleInCurrentDocumentSearch) {
                        docDef.visibleInCurrentDocumentSearch = true;
                        let parentField = field.parentField;
                        while (parentField != null) {
                            parentField.visibleInCurrentDocumentSearch = true;
                            parentField.collapsed = false;
                            parentField = parentField.parentField;
                        }
                    }
                }
            }
        }
    }

    private handleScroll(event: any) {
        this.scrollTop = event.target.scrollTop;
        this.lineMachine.redrawLinesForMappings();
    }

    private toggleSearch(): void  {
        this.searchMode = !this.searchMode;
        this.search(this.searchMode ? this.searchFilter : '');
    }

    private addField(docDef: DocumentDefinition, event: any): void {
        event.stopPropagation();
        const self: DocumentDefinitionComponent = this;
        this.modalWindow.reset();
        this.modalWindow.confirmButtonText = 'Save';
        const isProperty: boolean = docDef.initCfg.type.isProperty();
        const isConstant: boolean = docDef.initCfg.type.isConstant();
        this.modalWindow.headerText = isProperty ? 'Create Property' : (isConstant ? 'Create Constant' : 'Create Field');
        this.modalWindow.nestedComponentInitializedCallback = (mw: ModalWindowComponent) => {
            if (isProperty) {
                const propertyComponent: PropertyFieldEditComponent = mw.nestedComponent as PropertyFieldEditComponent;
                propertyComponent.initialize(null);
            } else if (isConstant) {
                const constantComponent: ConstantFieldEditComponent = mw.nestedComponent as ConstantFieldEditComponent;
                constantComponent.initialize(null);
            } else {
                const fieldComponent: FieldEditComponent = mw.nestedComponent as FieldEditComponent;
                fieldComponent.isSource = this.isSource;
                fieldComponent.initialize(null, docDef, true);
            }
        };
        this.modalWindow.nestedComponentType = isProperty ? PropertyFieldEditComponent
            : (isConstant ? ConstantFieldEditComponent : FieldEditComponent);
        this.modalWindow.okButtonHandler = (mw: ModalWindowComponent) => {
            if (isProperty) {
                const propertyComponent: PropertyFieldEditComponent = mw.nestedComponent as PropertyFieldEditComponent;
                docDef.addField(propertyComponent.getField());
            } else if (isConstant) {
                const constantComponent: ConstantFieldEditComponent = mw.nestedComponent as ConstantFieldEditComponent;
                docDef.addField(constantComponent.getField());
            } else {
                const fieldComponent: FieldEditComponent = mw.nestedComponent as FieldEditComponent;
                docDef.addField(fieldComponent.getField());
            }
            self.cfg.mappingService.saveCurrentMapping();
        };
        this.modalWindow.show();
    }

}