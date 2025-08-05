import { computed, signal, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { PagedResult, PagerModel, PagedFilteredRequest } from '../models';
import { ToasterService } from '../../layout';
import { HttpResponse } from '@angular/common/http';

/**
 * Базов клас за таблици с пагиниране, сортиране и търсене
 */
export abstract class BaseTableComponent<T> {
    protected readonly toaster = inject(ToasterService);
    protected readonly destroyRef = inject(DestroyRef);

    // Общи сигнали за всички таблици
    protected pagedList = signal<PagedResult<T> | null>(null);
    protected isLoading = signal<boolean>(false);
    protected currentPage = signal(1);
    protected pageSize = signal(10);
    protected searchTerm = signal<string | null>(null);
    protected sortBy = signal<string | null>(null);
    protected sortDescending = signal<boolean | null>(null);

    // Общи modal сигнали
    public showDeleteModal = signal(false);

    // Пагинационни размери
    protected pageSizes = [10, 50, 100];


    // Общи computed properties
    protected items = computed(() => this.pagedList()?.items || []);
    protected totalPages = computed(() => this.pagedList()?.totalPages || 0);
    protected totalCount = computed(() => this.pagedList()?.totalCount || 0);
    protected pageOffset = computed(() => {
        const currentPage = this.pagerData()?.page ?? 1;
        const currentPageSize = this.pagedList()?.pageSize ?? 10;
        return (currentPage - 1) * currentPageSize;
    });


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


    protected abstract loadDataFromService(request: PagedFilteredRequest): Observable<HttpResponse<PagedResult<T>>>;

    public loadData(): void {
        this.isLoading.set(true);
        const request = this.createPagedFilteredRequest();

        this.loadDataFromService(request)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: HttpResponse<PagedResult<T>>) => {
                    this.pagedList.set(response.body);
                    this.isLoading.set(false);
                },
                error: (error) => {
                    this.pagedList.set(null);
                    this.isLoading.set(false);
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

    // Общи методи за clear search
    public onClearSearch(): void {
        this.searchTerm.set("");
        this.currentPage.set(1);
        this.loadData();
    }

    // Общи modal методи за delete операции
    protected onCancelModalAction(): void {
        this.showDeleteModal.set(false);
    }
}
