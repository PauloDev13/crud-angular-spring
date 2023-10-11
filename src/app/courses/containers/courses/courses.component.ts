import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Course } from '../../model/course';
import { CoursesService } from '../../services/courses.service';
import { ConfirmationDialogComponent } from '../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from '../../shared/components/error-dialog/error-dialog.component';
import {Store} from "@ngrx/store";
import {AppStateModel} from "../../../store/global/app-state.model";
import {loadCourses, loadCourseSuccess} from "../../../store/course.action";
import {selectorCourse} from "../../../store/course.selector";
import {CoursesListModel} from "../../../store/course.model";

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
})
export class CoursesComponent {
  // courses$: Observable<Course[]> | null = null;
  courses$: Observable<CoursesListModel> | null = null;
  displayedColumns = ['name', 'category', 'actions'];

  constructor(
    public dialog: MatDialog,
    private coursesService: CoursesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private snackBar: MatSnackBar,
    private store: Store<AppStateModel>
  ) {
    // this.refresh();
    this.getCourses();
  }

  // refresh() {
  //   this.courses$ = this.coursesService.list().pipe(
  //     catchError(() => {
  //       this.onError('Erro ao carregar curso.');
  //       return of([]);
  //     }),
  //   );
  // }

  getCourses() {
    this.store.dispatch(loadCourses());
    this.courses$ = this.store.select(selectorCourse).pipe(
      catchError(() => {
        this.onError('Erro ao carregar curso.');
        return of({ courses: [] });
      })
    )
  }

  onAdd() {
    this.router.navigate(['new'], { relativeTo: this.activatedRoute });
  }

  onEdit(course: Course) {
    this.router.navigate(['edit', course._id], {
      relativeTo: this.activatedRoute,
    });
  }

  onDelete(course: Course) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'Tem certeza que deseja remover este curso?',
    });

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.coursesService.remove(course._id).subscribe({
          next: () => {
            // this.refresh();
            this.onSuccess();
          },
          error: () => this.onError('Erro ao remover curso!'),
        });
      }
    });
  }

  onError(errorMsg: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: errorMsg,
    });
  }

  private onSuccess() {
    this.snackBar.open('Curso excluido com sucesso!', 'X', {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'center',
    });
  }
}
