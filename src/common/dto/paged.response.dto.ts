import { ApiProperty } from '@nestjs/swagger';

export class PagedResponse<T> {
  @ApiProperty({ description: 'Lista de elementos', type: [Object], isArray: true })
  content: T[];
  @ApiProperty({ description: 'Página actual', examples: [1] })
  page: number;
  @ApiProperty({ description: 'Tamaño de la página', examples: [50] })
  size: number;
  @ApiProperty({ description: 'Número total de páginas', examples: [10] })
  totalPages: number;
  @ApiProperty({ description: 'Número total de elementos', examples: [100] })
  totalElements: number;
  @ApiProperty({ description: 'Indica si es la última página', examples: [true, false] })
  last: boolean;

  constructor(
    content: T[],
    page: number,
    size: number,
    totalPages: number,
    totalElements: number,
    last: boolean,
  ) {
    this.content = content;
    this.page = page;
    this.size = size;
    this.totalPages = totalPages;
    this.totalElements = totalElements;
    this.last = last;
  }
}
