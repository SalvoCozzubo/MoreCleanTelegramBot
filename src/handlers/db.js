const { DynamoDBDocumentClient, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

const getCurrentCounter = async () => {
  const params = {
    TableName: process.env.DB,
    Key: {
      pk: 'CURRENT',
      sk: 'CURRENT',
    },
  };

  const result = await ddbDocClient.send(new GetCommand(params));
  return result.Item?.counter ?? 0;
};

const incrementCounter = async () => {
  const params = {
    TableName: process.env.DB,
    Key: {
      pk: 'CURRENT',
      sk: 'CURRENT',
    },
    UpdateExpression: 'ADD #counter :c',
    ExpressionAttributeNames: {
      '#counter': 'counter',
    },
    ExpressionAttributeValues: {
      ':c': 1,
    },
    ReturnValues: 'UPDATED_NEW',
  };

  const result = await ddbDocClient.send(new UpdateCommand(params));
  return result.Attributes.counter;
};

module.exports = { getCurrentCounter, incrementCounter };