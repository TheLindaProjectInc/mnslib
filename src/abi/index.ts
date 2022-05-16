import { MNSMigrations } from './migrations/MNSMigrations';
import { BaseRegistrarImplementation } from './mrxregistrar/BaseRegistrarImplementation';
import { MRXRegistrarController } from './mrxregistrar/MRXRegistrarController';
import { NameWrapper } from './namewrapper/NameWrapper';
import { StaticMetadataService } from './namewrapper/StaticMetadataService';
import { MNSRegistry } from './registry/MNSRegistry';
import { MNSRegistryWithFallback } from './registry/MNSRegistryWithFallback';
import { ReverseRegistrar } from './registry/ReverseRegistrar';
import { TestRegistrar } from './registry/TestRegistrar';
import { DefaultReverseResolver } from './resolvers/DefaultReverseResolver';
import { PublicResolver } from './resolvers/PublicResolver';

const ABI = {
  MNSMigrations,
  BaseRegistrarImplementation,
  MRXRegistrarController,
  NameWrapper,
  StaticMetadataService,
  MNSRegistry,
  MNSRegistryWithFallback,
  ReverseRegistrar,
  TestRegistrar,
  DefaultReverseResolver,
  PublicResolver
};

export default ABI;
