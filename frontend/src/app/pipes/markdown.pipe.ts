import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'markdown',
  standalone: true
})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    
    let html = value
      // Convert line breaks to <br>
      .replace(/\n/g, '<br>')
      // Convert **bold** to <strong>
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    return html;
  }
}