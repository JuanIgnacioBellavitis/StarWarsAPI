import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('planets')
export class Planet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'swapi_uid', type: 'varchar', length: 64, unique: true })
  swapiUid: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;
}
