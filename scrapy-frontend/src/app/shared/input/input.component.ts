import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() type: string = 'text';
  @Input() readonly: boolean = false;
  @Input() errorMsg: string = '';

  value: any = '';

  private onChange = (_: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    if (this.type === 'date' && value) {
      const d = new Date(value);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      this.value = `${d.getFullYear()}-${month}-${day}`;
    } else {
      this.value = value ?? '';
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInputChange(value: string) {
    if (this.type === 'date') {
      this.onChange(value ? new Date(value) : null);
      this.value = value;
    } else {
      this.value = value;
      this.onChange(value);
    }
    this.onTouched();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.onInputChange(target.value);
  }
}
