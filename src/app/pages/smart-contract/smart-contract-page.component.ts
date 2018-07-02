import {AfterViewInit, Component, Inject, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Transaction} from '../../store/states/transaction';
import {AppState} from '../../app.state';
import {Store} from '@ngrx/store';
import {Config} from '../../store/states/config';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {APP_REFRESH} from '../../app.component';
import {TransactionType} from '../../store/states/transaction-type';

declare const BrowserSolc: any;

/**
 *
 */
@Component({
    selector: 'app-smart-contract-page',
    templateUrl: './smart-contract-page.component.html',
    styleUrls: ['./smart-contract-page.component.scss']
})
export class SmartContractPageComponent implements OnInit, AfterViewInit, OnDestroy {

    /**
     * Class Level-declarations
     */
    public configState: Observable<Config>;
    public config: Config;
    public configSubscription: any;
    public code = 'contract x { function g() {} }';
    public errors = [];
    public compiling = false;
    public contract: any;
    public deploying = false;
    public id: string;

    /**
     *
     * @param appService
     * @param {Store<AppState>} store
     * @param {HttpClient} httpClient
     */
    constructor(@Inject('AppService') public appService: any, private store: Store<AppState>, private httpClient: HttpClient) {
        this.configState = this.store.select('config');
        this.configSubscription = this.configState.subscribe((config: Config) => {
            this.config = config;
        });
    }

    /**
     *
     */
    ngOnInit() {
    }

    /**
     *
     */
    ngAfterViewInit() {
    }

    /**
     *
     */
    ngOnDestroy() {
        this.configSubscription.unsubscribe();
    }

    /**
     *
     * @param code
     */
    public onChange(code) {
        this.code = code;
    }

    /**
     *
     */
    public compile(): void {
        this.errors = [];
        this.contract = null;
        this.compiling = true;
        BrowserSolc.loadVersion('soljson-v0.4.6+commit.2dabbdf0.js', (compiler) => {
            const optimize = 1;
            const result = compiler.compile(this.code, optimize);
            this.compiling = false;
            this.errors = result.errors;
            this.contract = result.contracts[Object.keys(result.contracts)[0]];

            console.log(this.contract);

        });
    }

    /**
     *
     */
    public deploy(): void {
        this.appService.confirm('<p>Are you sure you want to deploy this contract?', () => {
            const transaction: Transaction = {
                type: TransactionType.DeploySmartContract,
                from: this.config.account.address,
                to: '',
                value: 0,
                code: this.contract.bytecode
            } as any;

            this.appService.hashAndSign(this.config.account.privateKey, transaction);
            this.deploying = true;
            const url = 'http://' + this.config.selectedDelegate.endpoint.host + ':' + this.config.selectedDelegate.endpoint.port + '/v1/transactions';
            this.httpClient.post(url, JSON.stringify(transaction), {headers: {'Content-Type': 'application/json'}}).subscribe((response: any) => {
                this.id = response.id;
                this.getStatus();
            });
        });


        this.deploying = true;
    }

    /**
     *
     */
    private getStatus(): void {
        setTimeout(() => {
            const url = 'http://' + this.config.selectedDelegate.endpoint.host + ':' + this.config.selectedDelegate.endpoint.port + '/v1/statuses/' + this.id;
            return this.httpClient.get(url, {headers: {'Content-Type': 'application/json'}}).subscribe((response: any) => {
                if (response.status === 'Pending') {
                    this.getStatus();
                    return;
                }

                if (response.status === 'Ok') {
                    this.appService.success('Smart contract deployed.');
                    this.appService.appEvents.emit({type: APP_REFRESH});
                } else {
                    this.appService.error(response.status);
                }
            });
        }, 500);
    }
}