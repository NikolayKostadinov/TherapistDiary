import { computed, signal, DestroyRef, inject, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { PagedResult, PagerModel, PagedFilteredRequest } from '../models';
import { ToasterService } from '../../layout';

/**
 * Базов клас за таблици с пагиниране, сортиране и търсене
 */
export abstract class BaseTableComponent<T> {
    protected readonly toaster = inject(ToasterService);
    protected readonly destroyRef = inject(DestroyRef);

    // Общи сигнали за всички таблици
    public pagedList = signal<PagedResult<T> | null>(null);
    public isLoading = signal<boolean>(false);
    public currentPage = signal(1);
    public pageSize = signal(10);
    public searchTerm = signal<string | null>(null);
    public sortBy = signal<string | null>(null);
    public sortDescending = signal<boolean | null>(null);
    public pageSizes = [10, 50, 100];

    // Общи computed properties
    public items = computed(() => this.pagedList()?.items || []);
    public totalPages = computed(() => this.pagedList()?.totalPages || 0);
    public totalCount = computed(() => this.pagedList()?.totalCount || 0);

    // Pager data за Pager компонента
    public pagerData = computed(() => {
        const pagedData = this.pagedList();
        if (!pagedData) return null;

        return {
            totalCount: pagedData.totalCount,
            page: pagedData.page,
            pageSize: pagedData.pageSize,
            totalPages: pagedData.totalPages,
            hasNextPage: pagedData.hasNextPage,
            hasPreviousPage: pagedData.hasPreviousPage
        } as PagerModel;
    });


    protected abstract loadDataFromService(request: PagedFilteredRequest): Observable<any>;

    protected abstract mapServiceResponse(response: any): PagedResult<T> | null;

    public loadData(): void {
        this.isLoading.set(true);
        const request = this.createPagedFilteredRequest();
        
        this.loadDataFromService(request)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    const mappedData = this.mapServiceResponse(response);
                    this.pagedList.set(mappedData);
                    this.isLoading.set(false);
                },
                error: (error) => {
                    this.pagedList.set(null);
                    this.isLoading.set(false);
                    this.handleLoadError(error);
                }
            });
    }

    protected createPagedFilteredRequest(): PagedFilteredRequest {
        return {
            pageNumber: this.currentPage(),
            pageSize: this.pageSize(),
            searchTerm: this.searchTerm(),
            sortBy: this.sortBy(),
            sortDescending: this.sortDescending()
        };
    }

    protected handleLoadError(error: any): void {
        console.error('Error loading data:', error);
    }

    // Методи за пагиниране
    public onPageChange(page: number): void {
        this.currentPage.set(page);
        this.loadData();
    }

    public onPageSizeChange(pageSize: number): void {
        this.pageSize.set(pageSize);
        this.currentPage.set(1);
        this.loadData();
    }

    // Методи за търсене
    public onSearch(searchTerm: string): void {
        this.searchTerm.set(searchTerm || null);
        this.currentPage.set(1);
        this.loadData();
    }

    public onSearchInput(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.onSearch(target.value);
    }

    // Методи за сортиране
    public onSort(sortBy: string): void {
        if (this.sortBy() === sortBy) {
            const current = this.sortDescending();
            this.toggleSortOrder(current);
        } else {
            this.sortBy.set(sortBy);
            this.sortDescending.set(false);
        }
        this.currentPage.set(1);
        this.loadData();
    }

    private toggleSortOrder(current: boolean | null): void {
        switch (current) {
            case null:
                this.sortDescending.set(false); // ascending
                break;
            case false:
                this.sortDescending.set(true); // descending
                break;
            case true:
                this.sortBy.set(null); // no sort
                this.sortDescending.set(null);
                break;
        }
    }

    public getSortIcon(column: string): string {
        if (this.sortBy() !== column) {
            return "fas fa-sort text-muted";
        }
        const isDescending = this.sortDescending();
        if (isDescending === false) {
            return "fas fa-sort-down text-primary"; // ascending
        } else if (isDescending === true) {
            return "fas fa-sort-up text-primary";   // descending
        }
        return "fas fa-sort text-muted"; // no sort
    }

    public isSortable(column: string): boolean {
        return true; 
    }
}
