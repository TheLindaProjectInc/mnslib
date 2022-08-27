import { IERC165, Transaction } from '@metrixcoin/metrilib';

/**
 * Interface that represents a DNS Resolver
 *
 * @interface
 */
export default interface DNSResolver extends IERC165 {
  /**
   * Set one or more DNS records.  Records are supplied in wire-format.
   * Records with the same node/name/resource must be supplied one after the
   * other to ensure the data is updated correctly. For example, if the data
   * was supplied:
   *     a.example.com IN A 1.2.3.4
   *     a.example.com IN A 5.6.7.8
   *     www.example.com IN CNAME a.example.com.
   * then this would store the two A records for a.example.com correctly as a
   * single RRSET, however if the data was supplied:
   *     a.example.com IN A 1.2.3.4
   *     www.example.com IN CNAME a.example.com.
   *     a.example.com IN A 5.6.7.8
   * then this would store the first A record, the CNAME, then the second A
   * record which would overwrite the first.
   *
   * @param node the namehash of the node for which to set the records
   * @param data the DNS wire format records to set
   * @returns {Promise<Transaction>} an array of TransactionReceipt objects
   */
  setDNSRecords(node: string, data: string): Promise<Transaction>;

  /**
   * Obtain a DNS record.
   * @param node the namehash of the node for which to fetch the record
   * @param name the keccak-256 hash of the fully-qualified name for which to fetch the record
   * @param resource the ID of the resource as per https://en.wikipedia.org/wiki/List_of_DNS_record_types
   * @returns {Promise<string>} the DNS record in wire format if present, otherwise empty
   */
  dnsRecord(node: string, name: string, resource: bigint): Promise<string>;

  /**
   * Check if a given node has records.
   * @param node the namehash of the node for which to check the records
   * @param name the namehash of the node for which to check the records
   * @returns {Promise<boolean>} has records
   */
  hasDNSRecords(node: string, name: string): Promise<boolean>;

  /**
   * Clear all information for a DNS zone.
   * @param node the namehash of the node for which to clear the zone
   * @returns {Promise<Transaction>} an array of TransactionReceipt objects
   */
  clearDNSZone(node: string): Promise<Transaction>;

  /**
   * setZonehash sets the hash for the zone.
   * May only be called by the owner of that node in the MNS registry.
   * @param node The node to update.
   * @param hash The zonehash to set
   * @returns {Promise<Transaction>} an array of TransactionReceipt objects
   */
  setZoneHash(node: string, hash: string): Promise<Transaction>;

  /**
   * zonehash obtains the hash for the zone.
   * @param node The MNS node to query.
   * @returns {Promise<string>} The associated contenthash.
   */
  zoneHash(node: string): Promise<string>;
}
