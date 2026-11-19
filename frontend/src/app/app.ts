import { Component, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { DatePipe, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

const API = 'http://localhost:3000/api';

@Component({
  selector: 'app-root',
  imports: [FormsModule, DatePipe],
  templateUrl: './app.html',
})
export class App {
  private http = inject(HttpClient);

  tasks = signal<any[]>([]);
  sprints = signal<any[]>([]);
  users = signal<any[]>([]);
  activeSprintId = signal('');
  search = signal('');
  error = signal('');

  showTaskForm = signal(false);
  showSprintForm = signal(false);
  showMemberForm = signal(false);

  activeSprint = computed(() =>
    this.sprints().find((s) => s._id === this.activeSprintId())
  );

  availableUsers = computed(() => {
    const ids = new Set((this.activeSprint()?.Members ?? []).map((m: any) => m._id));
    return this.users().filter((u) => !ids.has(u._id));
  });

  columns = [
    { key: 'todo', title: 'To Do' },
    { key: 'in_progress', title: 'In Progress' },
    { key: 'done', title: 'Done' },
  ];

  sprintForm = { Name: '', Goal: '', StartDate: '', EndDate: '', Members: [] as string[] };
  userForm = { UserName: '', Password: '' };
  taskForm = { Title: '', Text: '', UserId: '', StoryPoints: 1 };
  memberToAdd = '';

  constructor() {
    if (isPlatformBrowser(inject(PLATFORM_ID))) {
      this.loadSprints();
      this.loadUsers();
    }
  }

  // завантаження
  loadSprints() {
    this.http.get<any[]>(`${API}/sprints`).subscribe((s) => this.sprints.set(s));
  }

  loadUsers() {
    this.http.get<any[]>(`${API}/users`).subscribe((u) => this.users.set(u));
  }

  load() {
    if (!this.activeSprintId()) {
      this.tasks.set([]);
      return;
    }
    const params: any = { sprintId: this.activeSprintId() };
    if (this.search()) params.q = this.search();
    this.http.get<any[]>(`${API}/tasks`, { params }).subscribe((t) => this.tasks.set(t));
  }

  selectSprint(id: string) {
    this.activeSprintId.set(id);
    this.search.set('');
    this.load();
  }

  // спринти
  openSprintForm() {
    this.error.set('');
    this.showSprintForm.set(true);
  }

  toggleMember(id: string) {
    const m = this.sprintForm.Members;
    this.sprintForm.Members = m.includes(id) ? m.filter((x) => x !== id) : [...m, id];
  }

  createSprint() {
    this.error.set('');
    this.http.post<any>(`${API}/sprints`, this.sprintForm).subscribe({
      next: (s) => {
        this.sprintForm = { Name: '', Goal: '', StartDate: '', EndDate: '', Members: [] };
        this.showSprintForm.set(false);
        this.loadSprints();
        this.selectSprint(s._id);
      },
      error: (e) => this.error.set(e.error?.message ?? 'Error creating sprint'),
    });
  }

  // користувачі й учасники
  private createUser(done: (id: string) => void) {
    this.error.set('');
    this.http.post<{ id: string }>(`${API}/auth/register`, this.userForm).subscribe({
      next: (u) => {
        this.userForm = { UserName: '', Password: '' };
        this.loadUsers();
        done(u.id);
      },
      error: (e) => this.error.set(e.error?.message ?? 'Error creating user'),
    });
  }

  createUserForSprintForm() {
    this.createUser((id) => (this.sprintForm.Members = [...this.sprintForm.Members, id]));
  }

  createUserForActiveSprint() {
    this.createUser((id) => this.addMember(id));
  }

  openMemberForm() {
    this.error.set('');
    this.showMemberForm.set(true);
  }

  addMember(userId: string) {
    const s = this.activeSprint();
    if (!s || !userId) return;
    this.http
      .post(`${API}/sprints/${s._id}/members`, { userId })
      .subscribe(() => {
        this.memberToAdd = '';
        this.loadSprints();
      });
  }

  removeMember(userId: string) {
    const s = this.activeSprint();
    if (!s) return;
    this.http
      .delete(`${API}/sprints/${s._id}/members/${userId}`)
      .subscribe(() => this.loadSprints());
  }

  // задачі
  openTaskForm() {
    this.error.set('');
    this.showTaskForm.set(true);
  }

  createTask() {
    this.error.set('');
    const body = { ...this.taskForm, SprintId: this.activeSprintId() };
    this.http.post(`${API}/tasks`, body).subscribe({
      next: () => {
        this.taskForm = { Title: '', Text: '', UserId: '', StoryPoints: 1 };
        this.showTaskForm.set(false);
        this.load();
      },
      error: (e) => this.error.set(e.error?.message ?? 'Error creating task'),
    });
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

  initials(name?: string) {
    return (name ?? '?').slice(0, 2).toUpperCase();
  }
}