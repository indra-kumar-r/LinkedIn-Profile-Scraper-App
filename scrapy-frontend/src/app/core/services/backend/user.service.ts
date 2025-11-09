import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { environment } from '../../../../environments/environments';
import { Observable } from 'rxjs';
import { Users, User } from '../../../models/user.model';
import { UsersApis } from '../../constants/api-routes-constants';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = environment.api.user;

  constructor(private http: HttpService) {}

  getUsers(): Observable<Users> {
    return this.http.get<Users>(UsersApis.USERS, this.apiUrl);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(UsersApis.USERS, user, this.apiUrl);
  }

  get(userId: string): Observable<User> {
    return this.http.get<User>(
      `${UsersApis.USERS}/${encodeURIComponent(userId)}`,
      this.apiUrl
    );
  }

  update(userId: string, user: Partial<User>): Observable<User> {
    return this.http.put<User>(
      `${UsersApis.USERS}/${encodeURIComponent(userId)}`,
      user,
      this.apiUrl
    );
  }

  delete(userId: string): Observable<void> {
    return this.http.delete<void>(
      `${UsersApis.USERS}/${encodeURIComponent(userId)}`,
      this.apiUrl
    );
  }
}
