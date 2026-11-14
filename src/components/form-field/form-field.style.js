import hostStyle from '../../styles/host.style.js';
import formControlStyle from '../../styles/form-control.style.js';

// The stylesheet of el-form-field alone. A field that extends FormField brings a stylesheet of its
// own, with the same layout module for its own tag. A rule here for the tag of another field would
// reach that field only on a page that has an el-form-field as well, and would change it there.
export default [hostStyle('el-form-field'), formControlStyle('el-form-field')].join('\n');
