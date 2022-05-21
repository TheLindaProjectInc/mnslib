export default interface Deployment {
  MNSMigrations: string;
  MNSRegistry: string;
  MNSRegistryWithFallback: string;
  DefaultReverseResolver: string;
  ReverseRegistrar: string;
  BaseRegistrarImplementation: string;
  MRXRegistrarController: string;
  StaticMetadataService: string;
  NameWrapper: string;
  PublicResolver: string;
  TestRegistrar?: string;
  MRXtoUSDOracle?: string;
  DummyOracle?: string;
}
