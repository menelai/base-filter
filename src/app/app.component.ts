import {Component, OnInit} from '@angular/core';
import {TestFilter} from './test-filter';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'base-filter-test';

  frontFilter = new TestFilter(50, this.route.queryParams);

  constructor(
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.frontFilter.query$.subscribe(data => {
      console.log(data);
    });

    this.frontFilter.updated$.pipe(
    ).subscribe(f => {
      console.log(f.qsStringify());
    });
  }
}
