import type { UCheckboxInputModel } from '../components/input/UCheckboxInput.model';
import type { UDatetimeInputModel } from '../components/input/UDatetimeInput.model';
import type { UFileInputModel } from '../components/input/UFileInput.model';
import type { UNumberInputModel } from '../components/input/UNumberInput.model';
import type { UPasswordInputModel } from '../components/input/UPasswordInput.model';
import type { URangeInputModel } from '../components/input/URangeInput.model';
import type { USelectInputModel } from '../components/input/USelectInput.model';
import type { UTextInputModel } from '../components/input/UTextInput.model';
import type { UTextareaInputModel } from '../components/input/UTextareaInput.model';
export type PropertyMetaType = (
  'text' | 'textarea' | 'number' | 'checkbox' | 
  'password' | 'tel' | 'email' | 'url' | 'datetime' |
  'file' | 'range' | 'select' | 
  'object' | 'rest-url' | 'array' |
  'editor'
);

export type PropertyMetaData = (
  ({ type: 'text' } & UTextInputModel) | 
  ({ type: 'textarea' } & UTextareaInputModel) |
  ({ type: 'number' } & UNumberInputModel) | 
  ({ type: 'checkbox' } & UCheckboxInputModel) | 
  ({ type: 'password' } & UPasswordInputModel) |
  ({ type: 'datetime' } & UDatetimeInputModel) |
  ({ type: 'file' } & UFileInputModel) | 
  ({ type: 'range' } & URangeInputModel) |
  ({ type: 'select' } & USelectInputModel)
);