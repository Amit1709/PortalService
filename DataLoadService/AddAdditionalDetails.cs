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
    public static class AddAdditionalDetails
    {
        [FunctionName("AddAdditionalDetails")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            try
            {
                string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
                dynamic data = JsonConvert.DeserializeObject(requestBody);

                using (SqlCommand sqlCmd = new("INSERT INTO AdditionalDetails (uid, details, additionaldetails, subcategoryid, createdBy, updatedBy, createDate, updateDate) " +
                    "VALUES (@uid, @details, @adtdetails, @subcatid, @createdBy, @updatedBy, @createDate, @updateDate)"))
                {
                    sqlCmd.Parameters.AddWithValue("@uid", Guid.NewGuid());
                    sqlCmd.Parameters.AddWithValue("@details", SqlDbType.VarChar).Value = Convert.ToString(data?.name);
                    sqlCmd.Parameters.AddWithValue("@adtdetails", SqlDbType.VarChar).Value = Convert.ToString(data?.adtdetails);
                    sqlCmd.Parameters.AddWithValue("@subcatid", SqlDbType.Int).Value = Convert.ToInt32(data?.subcatid);
                    sqlCmd.Parameters.AddWithValue("@createdBy", 1);
                    sqlCmd.Parameters.AddWithValue("@updatedBy", 1);
                    sqlCmd.Parameters.AddWithValue("@createDate", SqlDbType.DateTime).Value = DateTime.Now;
                    sqlCmd.Parameters.AddWithValue("@updateDate", SqlDbType.DateTime).Value = DateTime.Now;
                    IActionResult response = await SqlOperationsHelper.ExecuteSqlAsync(sqlCmd);
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
