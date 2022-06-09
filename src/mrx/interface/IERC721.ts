import { Transaction } from '../Transaction';
import { IERC165 } from './IERC165';

/**
 * Interface that represents a contract, which implements EIP721
 *
 * @interface
 */
export interface IERC721 extends IERC165 {
  /**
   *  Returns the number of tokens in ``owner``'s account.
   */
  balanceOf(owner: string): Promise<bigint>;

  /**
   * Returns the owner of the `tokenId` token.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  ownerOf(tokenId: string): Promise<string>;

  /**
   * Safely transfers `tokenId` token from `from` to `to`, checking first that contract recipients
   * are aware of the ERC721 protocol to prevent tokens from being forever locked.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `to` cannot be the zero address.
   * - `tokenId` token must exist and be owned by `from`.
   * - If the caller is not `from`, it must be have been allowed to move this token by either {approve} or {setApprovalForAll}.
   * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
   *
   * Emits a {Transfer} event.
   */
  safeTransferFrom(
    from: string,
    to: string,
    tokenId: string
  ): Promise<Transaction>;

  /**
   * Transfers `tokenId` token from `from` to `to`.
   *
   * WARNING: Usage of this method is discouraged, use {safeTransferFrom} whenever possible.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `to` cannot be the zero address.
   * - `tokenId` token must be owned by `from`.
   * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
   *
   * Emits a {Transfer} event.
   */
  transferFrom(from: string, to: string, tokenId: string): Promise<Transaction>;

  /**
   * Gives permission to `to` to transfer `tokenId` token to another account.
   * The approval is cleared when the token is transferred.
   *
   * Only a single account can be approved at a time, so approving the zero address clears previous approvals.
   *
   * Requirements:
   *
   * - The caller must own the token or be an approved operator.
   * - `tokenId` must exist.
   *
   * Emits an {Approval} event.
   */
  approve(to: string, tokenId: string): Promise<Transaction>;

  /**
   * Returns the account approved for `tokenId` token.
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  getApproved(tokenId: string): Promise<string>;

  /**
   * Approve or remove `operator` as an operator for the caller.
   * Operators can call {transferFrom} or {safeTransferFrom} for any token owned by the caller.
   *
   * Requirements:
   *
   * - The `operator` cannot be the caller.
   *
   * Emits an {ApprovalForAll} event.
   */
  setApprovalForAll(operator: string, approved: boolean): Promise<Transaction>;

  /**
   * Returns if the `operator` is allowed to manage all of the assets of `owner`.
   *
   * See {setApprovalForAll}
   */
  isApprovedForAll(owner: string, operator: string): Promise<boolean>;

  /**
   * Safely transfers `tokenId` token from `from` to `to`.
   *
   * Requirements:
   *
   * - `from` cannot be the zero address.
   * - `to` cannot be the zero address.
   * - `tokenId` token must exist and be owned by `from`.
   * - If the caller is not `from`, it must be approved to move this token by either {approve} or {setApprovalForAll}.
   * - If `to` refers to a smart contract, it must implement {IERC721Receiver-onERC721Received}, which is called upon a safe transfer.
   *
   * Emits a {Transfer} event.
   */
  safeTransferFromData(
    from: string,
    to: string,
    tokenId: string,
    data: string
  ): Promise<Transaction>;

  /**
   *  Returns the token collection name.
   */
  name(): Promise<string>;

  /**
   *  Returns the token collection symbol.
   */
  symbol(): Promise<string>;

  /**
   *  Returns the Uniform Resource Identifier (URI) for `tokenId` token.
   */
  tokenURI(tokenId: string): Promise<string>;
}
