import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output, computed } from '@angular/core';
import { PagerModel } from '../../common';

@Component({
    selector: 'app-pager',
    imports: [CommonModule],
    templateUrl: './pager.html',
    styleUrl: './pager.css'
})
export class Pager {

    pageSizes = input<number[]>([10, 50, 100]);
    pager = input<PagerModel | null>(null);
    @Output() pageChange = new EventEmitter<number>();
    @Output() pageSizeChange = new EventEmitter<number>();

    protected pages = computed(() => {
        const pagerData = this.pager();
        if (!pagerData) return [];

        const totalPages = pagerData.totalPages || 1;
        const pageArray = Array.from({ length: totalPages }, (_, i) => i + 1);

        return pageArray;
    });

    constructor() { }

    get totalCount(): number {
        return this.pager()?.totalCount ?? 0;
    }

    get page(): number {
        return this.pager()?.page ?? 1;
    }

    get pageSize(): number {

        return this.pager()?.pageSize ?? this.pageSizes()?.[0];
    }

    get hasPreviousPage(): boolean {
        return this.pager()?.hasPreviousPage ?? false;
    }

    get hasNextPage(): boolean {
        return this.pager()?.hasNextPage ?? false;
    }



    onPageSizeChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        const newPageSize = parseInt(select.value);
        this.pageSizeChange.emit(newPageSize);
    }

    onPageClick(pageNumber: number) {
        this.pageChange.emit(pageNumber);
    }

    onNextPageClick() {
        this.pageChange.emit(this.page + 1);
    }
    onPreviousPageClick() {
        this.pageChange.emit(this.page - 1);
    }

}
