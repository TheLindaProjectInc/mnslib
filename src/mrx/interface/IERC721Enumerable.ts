import { IERC721 } from './IERC721';

/**
 * Interface that represents a contract, which implements EIP721Enumerable
 *
 * @interface
 */
export interface IERC721Enumerable extends IERC721 {
  /**
   * Returns the total amount of tokens stored by the contract.
   */
  totalSupply(): Promise<bigint>;

  /**
   * Returns a token ID owned by `owner` at a given `index` of its token list.
   * Use along with {balanceOf} to enumerate all of ``owner``'s tokens.
   */
  tokenOfOwnerByIndex(owner: string, index: bigint): Promise<string>;

  /**
   * Returns a token ID at a given `index` of all the tokens stored by the contract.
   * Use along with {totalSupply} to enumerate all tokens.
   */
  tokenByIndex(index: bigint): Promise<string>;
}
