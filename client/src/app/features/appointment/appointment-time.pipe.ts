import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentTimeModel } from './models/appointment-time.model';

@Pipe({
  name: 'appointmentTime'
})
export class AppointmentTimePipe implements PipeTransform {

  transform(value: AppointmentTimeModel): unknown {
    return `${value.start} - ${value.end}`;
  }
}
