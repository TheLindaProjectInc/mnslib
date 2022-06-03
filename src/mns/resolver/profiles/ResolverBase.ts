export default interface ResolverBase {
  supportsInterface(interfaceId: string): Promise<boolean>;
  isAuthorized(node: string): Promise<boolean>;
}
