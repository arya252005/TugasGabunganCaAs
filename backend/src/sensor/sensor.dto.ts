import { IsString, IsNumber, IsOptional, IsIn, Min, Max } from 'class-validator'

//TODO: DTO for receive data from cloud
export class CreateSensorDto {
  @IsString()
  sensorId: string

  @IsOptional()
  @IsString()
  lokasi?: string

  @IsNumber()
  temp: number        

  @IsNumber()
  hum: number         

  @IsNumber()
  soil: number        

  @IsNumber()
  @Min(0)
  @Max(100)
  moisture: number    

  @IsNumber()
  @IsIn([0, 1])
  label: number       
}

//TODO: DTO for query filter history
export class SensorQueryDto {
  @IsOptional()
  @IsString()
  sensorId?: string

  @IsOptional()
  hours?: number      

  @IsOptional()
  limit?: number      
}