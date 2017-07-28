/**
 * OAuth認証情報
 */

interface ICredentials {
  refresh_token?: string;
  expiry_date?: number;
  access_token?: string;
  token_type?: string;
}
export default ICredentials;
