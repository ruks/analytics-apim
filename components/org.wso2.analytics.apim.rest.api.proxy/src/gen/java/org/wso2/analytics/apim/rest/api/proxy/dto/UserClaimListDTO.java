package org.wso2.analytics.apim.rest.api.proxy.dto;


import com.google.gson.annotations.SerializedName;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import java.util.ArrayList;
import java.util.List;
import org.wso2.analytics.apim.rest.api.proxy.dto.UserClaimDTO;
import java.util.Objects;

/**
 * UserClaimListDTO
 */
public class UserClaimListDTO   {
  @SerializedName("list")
  private List<UserClaimDTO> list = new ArrayList<UserClaimDTO>();

  public UserClaimListDTO list(List<UserClaimDTO> list) {
    this.list = list;
    return this;
  }

  public UserClaimListDTO addListItem(UserClaimDTO listItem) {
    this.list.add(listItem);
    return this;
  }

   /**
   * Get list
   * @return list
  **/
  @ApiModelProperty(value = "")
  public List<UserClaimDTO> getList() {
    return list;
  }

  public void setList(List<UserClaimDTO> list) {
    this.list = list;
  }


  @Override
  public boolean equals(java.lang.Object o) {
    if (this == o) {
      return true;
    }
    if (o == null || getClass() != o.getClass()) {
      return false;
    }
    UserClaimListDTO userClaimList = (UserClaimListDTO) o;
    return Objects.equals(this.list, userClaimList.list);
  }

  @Override
  public int hashCode() {
    return Objects.hash(list);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    sb.append("class UserClaimListDTO {\n");
    
    sb.append("    list: ").append(toIndentedString(list)).append("\n");
    sb.append("}");
    return sb.toString();
  }

  /**
   * Convert the given object to string with each line indented by 4 spaces
   * (except the first line).
   */
  private String toIndentedString(java.lang.Object o) {
    if (o == null) {
      return "null";
    }
    return o.toString().replace("\n", "\n    ");
  }
}

