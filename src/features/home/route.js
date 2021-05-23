import { HomePage, Referrals } from './';

export default {
  path: '',
  childRoutes: [
    { path: 'index', component: HomePage, isIndex: true },
    { path: 'referrals', component: Referrals, isIndex: false },
  ],
};
