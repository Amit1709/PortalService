using DataLoadService.Common;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace DataLoadService
{
    public static class GetSubCategoryList
    {
        [FunctionName("GetSubCategoryList")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("Get Sub Category List function processed a request.");
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            int pageNumber = data?.PageNumber;
            int pageSize = data?.PageSize;
            int topicId = data?.CategoryId;
            string connectionString = Environment.GetEnvironmentVariable("SqlConnectionString");
            if (string.IsNullOrEmpty(connectionString)) { return new StatusCodeResult(StatusCodes.Status500InternalServerError); }
            List<SubCategory> SubCategories = [];
            try
            {
                await using (SqlConnection connection = new(connectionString))
                {

                    await connection.OpenAsync();
                    string query = "SELECT Id,title FROM SubCategoryOfTopics where topicid=" + topicId;
                    await using (SqlCommand command = new(query, connection))
                    {
                        SqlDataReader reader = await command.ExecuteReaderAsync();
                        while (await reader.ReadAsync())
                        {
                            var SubCatagory = new SubCategory()
                            {
                                Id = reader.GetInt32(reader.GetOrdinal("Id")),
                                Title = reader.GetString(reader.GetOrdinal("title")),
                            };
                            SubCategories.Add(SubCatagory);
                        }
                    }
                }
                return new OkObjectResult(new PagedViewModel<SubCategory>(SubCategories.AsQueryable(), pageNumber, pageSize));
            }
            catch (Exception ex) { log.LogError($"An error occurred: {ex.Message}"); return new StatusCodeResult(StatusCodes.Status500InternalServerError); }
        }
    }
}
