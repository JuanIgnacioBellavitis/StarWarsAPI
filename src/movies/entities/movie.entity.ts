import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Person } from '../../swapi-sync/entities/person.entity';
import { Planet } from '../../swapi-sync/entities/planet.entity';
import { Species } from '../../swapi-sync/entities/species.entity';
import { Starship } from '../../swapi-sync/entities/starship.entity';
import { Vehicle } from '../../swapi-sync/entities/vehicle.entity';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'swapi_uid',
    type: 'varchar',
    length: 64,
    nullable: true,
    unique: true,
  })
  swapiUid: string | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'release_year', type: 'int' })
  releaseYear: number;

  @Column({ type: 'varchar', length: 255 })
  director: string;

  @Column({ name: 'opening_crawl', type: 'text', nullable: true })
  openingCrawl: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  producer: string | null;

  @Column({ name: 'episode_id', type: 'int', nullable: true })
  episodeId: number | null;

  @ManyToMany(() => Person, { eager: false, cascade: ['insert', 'update'] })
  @JoinTable({ name: 'movie_characters' })
  characters: Person[];

  @ManyToMany(() => Planet, { eager: false, cascade: ['insert', 'update'] })
  @JoinTable({ name: 'movie_planets' })
  planets: Planet[];

  @ManyToMany(() => Species, { eager: false, cascade: ['insert', 'update'] })
  @JoinTable({ name: 'movie_species' })
  species: Species[];

  @ManyToMany(() => Starship, { eager: false, cascade: ['insert', 'update'] })
  @JoinTable({ name: 'movie_starships' })
  starships: Starship[];

  @ManyToMany(() => Vehicle, { eager: false, cascade: ['insert', 'update'] })
  @JoinTable({ name: 'movie_vehicles' })
  vehicles: Vehicle[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
