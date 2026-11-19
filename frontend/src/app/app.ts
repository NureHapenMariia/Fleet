import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

const API = 'http://localhost:3000/api';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  templateUrl: './app.html',
})
export class App {
  private http = inject(HttpClient);

  tasks = signal<any[]>([]);
  sprints = signal<any[]>([]);
  users = signal<any[]>([]);
  search = signal('');
  sprintId = signal('');
  showForm = signal(false);

  columns = [
    { key: 'todo', title: 'To Do' },
    { key: 'in_progress', title: 'In Progress' },
    { key: 'done', title: 'Done' },
  ];

  form = { Title: '', Text: '', UserId: '', SprintId: '', StoryPoints: 1 };

  constructor() {
    this.http.get<any[]>(`${API}/sprints`).subscribe((s) => this.sprints.set(s));
    this.http.get<any[]>(`${API}/users`).subscribe((u) => this.users.set(u));
    this.load();
  }

  load() {
    const params: any = {};
    if (this.search()) params.q = this.search();
    if (this.sprintId()) params.sprintId = this.sprintId();
    this.http.get<any[]>(`${API}/tasks`, { params }).subscribe((t) => this.tasks.set(t));
  }

  byStatus(key: string) {
    return this.tasks().filter((t) => t.Status === key);
  }

  move(task: any, status: string) {
    this.http.put(`${API}/tasks/${task._id}`, { Status: status }).subscribe(() => this.load());
  }

  remove(task: any) {
    this.http.delete(`${API}/tasks/${task._id}`).subscribe(() => this.load());
  }

  create() {
    this.http.post(`${API}/tasks`, this.form).subscribe(() => {
      this.showForm.set(false);
      this.form = { Title: '', Text: '', UserId: '', SprintId: '', StoryPoints: 1 };
      this.load();
    });
  }

  initials(name?: string) {
    return (name ?? '?').slice(0, 2).toUpperCase();
  }
}