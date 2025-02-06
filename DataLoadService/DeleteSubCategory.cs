using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using DataLoadService.Common;
using Microsoft.Data.SqlClient;
using System.Data;

namespace DataLoadService
{
    public static class DeleteSubCategory
    {
        [FunctionName("DeleteSubCategory")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# Delete sub category initiated.");

            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                dynamic data = JsonConvert.DeserializeObject(requestBody);

                using (SqlCommand sqlCmd = new("delete from [References] where subcategoryid=@id"))
                {
                    sqlCmd.Parameters.AddWithValue("@id", SqlDbType.Int).Value = Convert.ToInt32(data?.id);
                    IActionResult response = await SqlOperationsHelper.ExecuteSqlAsync(sqlCmd);
                }
                log.LogInformation("Deleted references!");
                using (SqlCommand sqlCmd = new("delete from AdditionalDetails where subcategoryid=@id"))
                {
                    sqlCmd.Parameters.AddWithValue("@id", SqlDbType.Int).Value = Convert.ToInt32(data?.id);
                    IActionResult response = await SqlOperationsHelper.ExecuteSqlAsync(sqlCmd);
                }
                log.LogInformation("Deleted additional details!");
                using (SqlCommand sqlCmd = new("delete from SubCategoryOfTopics where Id=@id"))
                {
                    sqlCmd.Parameters.AddWithValue("@id", SqlDbType.Int).Value = Convert.ToInt32(data?.id);
                    IActionResult response = await SqlOperationsHelper.ExecuteSqlAsync(sqlCmd);
                    log.LogInformation("Deleted sub category.");
                    return response;
                }                
            }
            catch (Exception e)
            {
                log.LogError(e.Message);
                return new StatusCodeResult(StatusCodes.Status500InternalServerError);
            }
        }
    }
}
